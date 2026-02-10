import { Home, User, PlusSquare, Search, LogOut } from "lucide-react";

// Define the menu items used in both Sidebar (Desktop) and BottomNav (Mobile)
export const NAV_ITEMS = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Create",
    path: "/create-post", // We will make this a modal later
    icon: PlusSquare,
  },
  {
    label: "Profile",
    path: "/me",
    icon: User,
  },
];