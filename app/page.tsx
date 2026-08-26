import { Button } from "@/components/ui/button";
import React from "react";

const Home = () => {
  return (
    <div>
      Home
      <Button className="rounded-sm bg-blue-700 text-gray-50 hover:bg-blue-600">
        {" "}
        Click to Login
      </Button>
    </div>
  );
};

export default Home;
