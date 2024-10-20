import Image from "next/image";

import variables from "@/assets/vars.png";

export default function TheHow() {
  /**
   * template editor
   * workspace analytics
   * job tracking
   * document generation
   */
  return (
    <section className="my-20 relative mx-auto h-full w-full overflow-hidden">
      <div className="mx-auto grid grid-cols-12 max-w-7xl">
        <div className="col-span-6 p-6">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolor
          dolore autem, et, ullam veniam quo reprehenderit atque accusamus
          tempora repudiandae odio, at quibusdam rerum expedita consequuntur
          voluptatem veritatis magnam?
        </div>

        <div className="w-screen col-span-6">
          <div className="rounded-xl w-fit bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
            <Image
              src={variables}
              alt="Product screenshot"
              className="w-[48rem] rounded-xl shadow-2xl ring-1 ring-gray-400/10 sm:w-[64rem]"
              width={2400}
              height={1800}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
