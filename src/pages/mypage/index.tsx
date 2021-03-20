import React, { useState } from "react"
import { RoundedButton, RoundedDivSize } from "../../components/Button/RoundButton"
import { EditButton } from "../../components/Button/EditButton"
import styled from "styled-components"
import Image from "next/image"

const Index: React.FC = () => {
  const InputBox = styled.input`
    &::placeholder {
      color: #a7a7a7;
      font-size: 1rem;
      padding-left: 0.75rem;
    }
  `
  const TextBox = styled.textarea`
    &::placeholder {
      color: #a7a7a7;
      font-size: 1rem;
      padding-left: 0.75rem;
    }
  `
  // TODO:データベースが出来次第使用
  const [nameInput, nameSetInput] = useState<string>()
  // TODO:データベースが出来次第使用
  const [profileInput, setProfileInput] = useState<string>()

  const [imageEditState, setImageEditState] = useState<boolean>(false)
  const setImageEditSetter = (isCheckedImage: boolean) => setImageEditState(isCheckedImage)

  const [userEditState, setUserEditState] = useState<boolean>(false)
  const setUserEditSetter = (isCheckedUser: boolean) => setUserEditState(isCheckedUser)

  const [profileEditState, setProfileEditState] = useState<boolean>(false)
  const setEditSetter = (isCheckedProfile: boolean) => setProfileEditState(isCheckedProfile)

  return (
    <>
      <div className={"flex justify-center"}>
        <div className={"flex justify-center h-40"}>
          <Image src={"/images/icon/profileImage.svg"} alt={"pen"} width={140} height={140} />
          <div className={"pb-4 pr-4"}>
            <EditButton edit={imageEditState} setter={setImageEditSetter} />
          </div>
        </div>
        <div className={"pl-8 w-2/5"}>
          <div className={"flex"}>
            <p className={"text-2xl mr-4 font-bold"}>ユーザー名</p>
            <EditButton edit={userEditState} setter={setUserEditSetter} />
          </div>
          {userEditState ? (
            <InputBox
              type={"text"}
              className={"border border-solid border-lightgray w-4/5 h-10 rounded-md"}
              placeholder={"名前を入力"}
              value={nameInput}
            />
          ) : (
            <p className={"text-gray text-3xl font-bold"}>ステッカーズ・ボブ</p>
          )}
          <div className={"flex pt-6"}>
            <p className={"text-2xl mr-4 font-bold"}>プロフィール</p>
            <EditButton edit={profileEditState} setter={setEditSetter} />
          </div>
          {profileEditState ? (
            <TextBox
              name={"プロフィール"}
              rows={6}
              className={"border border-solid border-lightgray w-full rounded-md"}
              cols={200}
              placeholder={"プロフィール入力"}
            />
          ) : (
            <>
              <p className={"text-gray text-left"}>
                クリエーターに向けて「 ステッカー
                」という形のファンから小さい応援を贈ることができます。
                <br />
                クリエーターはステッカーを貼ってもらうPCをバーチャルで作るだけで始めることができます。
              </p>
            </>
          )}
        </div>
      </div>
      <p className={"text-gray text-center pt-40"}>
        応援してもらうにはStripeアカウントが必要です。
        <br />
        連携をしてマイPCを作りましょう
      </p>
      <div className={"w-1/4 mx-auto pt-6"}>
        <RoundedButton
          size={RoundedDivSize.M}
          onClick={() => {}}
          text={"Stripeアカウントを連携する"}
        />
      </div>
    </>
  )
}
export default Index
