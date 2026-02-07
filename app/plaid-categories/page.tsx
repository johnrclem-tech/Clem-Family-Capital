"use client";

import * as React from "react";

// DEPRECATED: This page is deprecated. Plaid categories are now merged into the Categories page.
// All Plaid category fields are now displayed directly in the Categories table.
export default function PlaidCategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Plaid Categories Page Deprecated</h1>
        <p className="text-muted-foreground mb-4">
          This page has been deprecated. Plaid categories are now merged into the Categories page.
        </p>
        <p className="text-muted-foreground mb-4">
          All Plaid category information (Detailed Category ID, Primary Category, and Description) 
          is now displayed directly in the Categories table.
        </p>
        <p className="text-muted-foreground">
          Please use the <a href="/categories" className="text-primary underline">Categories page</a> instead.
        </p>
      </div>
    </div>
  );
}
