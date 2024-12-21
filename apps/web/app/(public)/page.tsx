import { Hero } from "./hero";
import TheHow from "./the-how";
import { TheWhat } from "./the-what";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <TheWhat />
      {/* <TheHow /> */}
    </>
  );
}
