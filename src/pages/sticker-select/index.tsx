import React, { useState } from "react"
import Image from "next/image"
import { RoundedButton, RoundedDivSize } from "../../components/Button/RoundButton"

const Index: React.VFC<{}> = () => {
  const inputOnChange = () => {}
  const settlementOnClick = () => {}
  const [index, setIndex] = useState(0)
  const imageList: string[] = ["/logo/logo.svg", "/logo/logo.svg", "/logo/logo.svg"]

  return (
    <section>
      {/*select area*/}
      <div className="container mx-auto">
        <h2 className="font-bold text-3xl p-5 text-center">ステッカーを選択しよう</h2>
        <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-16 mb-10 w-1/2 mx-auto">
          {imageList.map((img, i) =>
            i == index ? (
              <div
                className="aspect-w-1 aspect-h-1 shadow-lg rounded-lg relative"
                onClick={() => {
                  setIndex(i)
                }}
              >
                <div className="w-20 h-20 m-auto">
                  <Image src={img} width={80} height={80} />
                </div>

                <div className="absolute w-8 h-8 -top-3 -left-3">
                  <Image src="/icon/check.svg" width={80} height={80} />
                </div>
              </div>
            ) : (
              <div
                className="aspect-w-1 aspect-h-1 shadow-lg rounded-lg relative"
                onClick={() => {
                  setIndex(i)
                }}
              >
                <div className="w-20 h-20 m-auto">
                  <Image src={img} width={80} height={80} />
                </div>
              </div>
            )
          )}
        </div>
        {/*end select area*/}

        <div className="text-center mb-8">
          <div className="flex items-center justify-center bg-grey-lighter">
            <label className="xl:w-1/3 lg:w-1/2 md:w-2/3 w-full flex justify-center items-center px-4 py-2 bg-orange text-white rounded-full shadow-lg tracking-wide uppercase border border-orange cursor-pointer hover:opacity-75">
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span className="mt-2 text-base">アップロードする</span>

              <input
                className=""
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={() => inputOnChange()}
                hidden={true}
              />
            </label>
          </div>
        </div>

        <div className="xl:w-1/3 lg:w-1/2 md:w-2/3 w-full mx-auto flex justify-between">
          <RoundedButton
            size={RoundedDivSize.M}
            onClick={() => settlementOnClick()}
            text={"決済へ進む"}
          />
        </div>
      </div>
    </section>
  )
}

export default Index