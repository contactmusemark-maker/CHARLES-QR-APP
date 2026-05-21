import { createContext, useContext, useState, ReactNode } from "react";

interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface EmployeeProfile {
  employeeId: string;
  fullName: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeContextType {
  employee: Employee | null;
  setEmployee: (emp: Employee | null) => void;
  profile: EmployeeProfile | null;
  setProfile: (profile: EmployeeProfile | null) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  clearSession: () => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const clearSession = () => {
    setEmployee(null);
    setProfile(null);
    setSelectedMood(null);
  };

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee, profile, setProfile, selectedMood, setSelectedMood, clearSession }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
