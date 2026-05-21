import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmployeeProvider } from "@/context/employee-context";
import { AnimatePresence } from "framer-motion";

import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import MoodSelect from "@/pages/mood-select";
import MoodDetail from "@/pages/mood-detail";
import Success from "@/pages/success";
import Admin from "@/pages/admin";
import QrPoster from "@/pages/qr-poster";
import EmployeeTrend from "@/pages/employee-trend";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/mood" component={MoodSelect} />
        <Route path="/mood/detail" component={MoodDetail} />
        <Route path="/success" component={Success} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/employee/:employeeId" component={EmployeeTrend} />
        <Route path="/poster" component={QrPoster} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EmployeeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </EmployeeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
