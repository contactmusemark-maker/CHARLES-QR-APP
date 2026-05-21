import { Router } from "express";
import { db, employeeProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetEmployeeProfileParams, UpsertEmployeeProfileBody, UpsertEmployeeProfileParams } from "@workspace/api-zod";
import multer from "multer";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

function getSupabase() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function extFromMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

function toApiProfile(p: {
  id: number;
  employeeId: string;
  fullName: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    employeeId: p.employeeId,
    fullName: p.fullName,
    department: p.department,
    email: p.email,
    phone: p.phone,
    profileImageUrl: p.profileImageUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// POST /profiles/:employeeId/avatar (multipart/form-data field: file)
router.post("/profiles/:employeeId/avatar", upload.single("file"), async (req, res) => {
  const params = GetEmployeeProfileParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid employeeId" });

  const file = req.file;
  if (!file) return res.status(400).json({ error: "Missing file" });

  const ext = extFromMime(file.mimetype);
  if (!ext) return res.status(400).json({ error: "Unsupported file type. Use jpg, png, or webp." });

  const bucket = process.env["SUPABASE_STORAGE_BUCKET"] ?? "employee-profiles";
  const employeeId = params.data.employeeId.trim();
  const safeEmployeeId = employeeId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const objectPath = `avatars/${safeEmployeeId}/${crypto.randomUUID()}.${ext}`;

  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });

  if (error) return res.status(500).json({ error: `Upload failed: ${error.message}` });

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const publicUrl = data.publicUrl;

  return res.status(200).json({ url: publicUrl });
});

// GET /profiles/:employeeId
router.get("/profiles/:employeeId", async (req, res) => {
  const parsed = GetEmployeeProfileParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid employeeId" });

  const employeeId = parsed.data.employeeId;
  const rows = await db
    .select()
    .from(employeeProfilesTable)
    .where(eq(employeeProfilesTable.employeeId, employeeId))
    .limit(1);
  const row = rows[0];

  if (!row) return res.status(404).json({ error: "Profile not found" });
  return res.json(toApiProfile(row));
});

// PUT /profiles/:employeeId
router.put("/profiles/:employeeId", async (req, res) => {
  const params = UpsertEmployeeProfileParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid employeeId" });

  const body = UpsertEmployeeProfileBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid request body", details: body.error.issues });

  const employeeId = params.data.employeeId;
  const data = body.data;

  const existingRows = await db
    .select({ id: employeeProfilesTable.id })
    .from(employeeProfilesTable)
    .where(eq(employeeProfilesTable.employeeId, employeeId))
    .limit(1);
  const existing = existingRows[0];

  if (!existing) {
    const [created] = await db
      .insert(employeeProfilesTable)
      .values({
        employeeId,
        fullName: data.fullName,
        department: data.department ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        profileImageUrl: data.profileImageUrl ?? null,
      })
      .returning();

    return res.status(200).json(toApiProfile(created));
  }

  const [updated] = await db
    .update(employeeProfilesTable)
    .set({
      fullName: data.fullName,
      department: data.department ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      profileImageUrl: data.profileImageUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(employeeProfilesTable.employeeId, employeeId))
    .returning();

  return res.status(200).json(toApiProfile(updated));
});

export default router;
