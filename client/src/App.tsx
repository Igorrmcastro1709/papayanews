import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Challenges from "./pages/Challenges";
import Forum from "./pages/Forum";
import Chat from "./pages/Chat";
import Calendar from "./pages/Calendar";
import UserProfile from "./pages/UserProfile";
import Members from "./pages/Members";
import Archive from "./pages/Archive";
import Library from "./pages/Library";
import Shop from "./pages/Shop";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/profile"} component={Profile} />
      <Route path="/search" component={Search} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/forum" component={Forum} />
      <Route path="/chat" component={Chat} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/user/:id" component={UserProfile} />
      <Route path="/members" component={Members} />
      <Route path="/archive" component={Archive} />
      <Route path="/library" component={Library} />
      <Route path="/shop" component={Shop} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
