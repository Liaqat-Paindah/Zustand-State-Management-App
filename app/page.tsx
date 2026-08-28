"use client";

import { Button } from "@/components/ui/button";
import { useCounterStore } from "@/stores/counterStore";
const Home = () => {
  const count = useCounterStore();
  return (
    <div>
      <Button
        onClick={count.INC}
        className="rounded-sm bg-blue-700 text-gray-50 hover:bg-blue-600"
      >
        +
      </Button>
      Count: {count.count}
      <Button
        onClick={count.DEC}
        className="rounded-sm bg-blue-700 text-gray-50 hover:bg-blue-600"
      >
        -
      </Button>
      <br />
      <Button
        onClick={count.RESET}
        className="rounded-sm bg-blue-700 text-gray-50 hover:bg-blue-600"
      >
        Reset
      </Button>
    </div>
  );
};

export default Home;
