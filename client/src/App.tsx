import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import "@/lib/firebase";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import Detail from "@/pages/Detail";
import Genres from "@/pages/Genres";
import Search from "@/pages/Search";
import Watch from "@/pages/Watch";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:name" component={Category} />
      <Route path="/genres" component={Genres} />
      <Route path="/search" component={Search} />
      <Route path="/watch" component={Watch} />
      <Route path="/history" component={History} />
      <Route path="/detail" component={Detail} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
