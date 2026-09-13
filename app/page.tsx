"use client";

import { Suspense } from "react";
import Login from "./(auth)/login/page";
import Loading from "./loading";
export default function Home() {
  return (
    <div>
      <Suspense
        fallback={
          <>
            <Loading></Loading>
          </>
        }
      >
        <Login></Login>
      </Suspense>
    </div>
  );
}
