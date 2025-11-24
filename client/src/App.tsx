import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import UploadSimple from "./pages/UploadSimple";
import Dashboard from "./pages/Dashboard";
import Review from "./pages/Review";
import NotFoundSearches from "./pages/NotFoundSearches";
import MultipleResults from "./pages/MultipleResults";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/upload-simple"} component={UploadSimple} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/review"} component={Review} />
      <Route path={"/not-found-searches"} component={NotFoundSearches} />
      <Route path={"/multiple-results"} component={MultipleResults} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
