import type { Metadata } from "next";
import { Suspense } from "react";

import AccountView from "@/components/AccountView";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <Suspense>
      <AccountView />
    </Suspense>
  );
}
