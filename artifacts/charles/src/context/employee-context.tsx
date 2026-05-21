import { createContext, useContext, useState, ReactNode } from "react";

interface Employee {
  id: string;
  name: string;
}

interface EmployeeContextType {
  employee: Employee | null;
  setEmployee: (emp: Employee | null) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  clearSession: () => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const clearSession = () => {
    setEmployee(null);
    setSelectedMood(null);
  };

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee, selectedMood, setSelectedMood, clearSession }}>
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
