import { loadStripe } from "@stripe/stripe-js"
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe
} from "@stripe/react-stripe-js"
import StripeAPI from "stripe"
import axios from "axios"
import React, { useState } from "react"
import { StatusCodes } from "http-status-codes"
import Image from "next/image"
import { RoundedButton, RoundedDivSize } from "../../components/Button/RoundButton"
import { Toast, ToastType } from "../../components/toast"
import Header from "../../components/header"
import { Footer } from "../../components/Footer"
import { useRouter } from "next/router"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const Index: React.VFC<{}> = () => {
  return (
    <Elements stripe={stripePromise}>
      <CardForm />
    </Elements>
  )
}

const CardForm: React.VFC<{}> = () => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>("")
  const [toastType, setToastType] = useState<ToastType>(ToastType.Notification)
  const [toastState, setToastState] = useState<boolean>(false)
  const hostName = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` || "http://localhost:3000"

  // TODO: 支払い先のaccountIdを設定
  const creatorId = "acct_1IWG3iPwhcz9FWG1"

  // TODO: 支払い金額の適切な設定
  const price = 500
  const platformFee = 100

  // HACK: StripeのSDK(import Stripe from "stripe")でうまく送信できないのでaxiosを使用
  // StripeのAPI用のインスタンスを生成
  const axiosInstance = axios.create({
    baseURL: hostName,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
    },
    timeout: 2000
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    if (!stripe || !elements) {
      return
    }

    // TODO: もしDBでカスタマーIDを保持している場合はそれを使用する
    // カスタマー作成
    const customerParams: StripeAPI.CustomerCreateParams = {
      name: "test"
    }
    let axiosParams = new URLSearchParams()
    Object.keys(customerParams).forEach((key) => {
      axiosParams.append(key, customerParams[key])
    })
    let response = await axiosInstance.post("https://api.stripe.com/v1/customers", axiosParams)
    if (response.status !== StatusCodes.OK) {
      setToastType(ToastType.Error)
      setToastMessage(response.data.error)
      setToastState(true)
      console.log(response.data.error)
      setLoading(false)
      return
    }
    const customer: StripeAPI.Customer = response.data

    // setupIntent作成
    const setupIntentParams: StripeAPI.SetupIntentCreateParams = {
      customer: customer.id
    }
    axiosParams = new URLSearchParams()
    Object.keys(setupIntentParams).forEach((key) => {
      axiosParams.append(key, setupIntentParams[key])
    })
    response = await axiosInstance.post("https://api.stripe.com/v1/setup_intents", axiosParams)
    if (response.status !== StatusCodes.OK) {
      setToastType(ToastType.Error)
      setToastMessage(response.data.error)
      setToastState(true)
      console.log(response.data.error)
      setLoading(false)
      return
    }
    const setupIntent: StripeAPI.SetupIntent = response.data

    // setupIntent.client_secretを使用してStripeへカード情報を送付する
    const resultCardSetup = await stripe.confirmCardSetup(setupIntent.client_secret, {
      payment_method: {
        card: elements.getElement("cardNumber"),
        billing_details: {
          name: customer.name
        }
      }
    })
    if (resultCardSetup.error) {
      setToastType(ToastType.Error)
      setToastMessage(resultCardSetup.error.message)
      setToastState(true)
      console.log(resultCardSetup.error)
      setLoading(false)
      return
    }

    // paymentMethodの情報を取得
    const getPaymentMethodsParams: StripeAPI.PaymentMethodListParams = {
      customer: customer.id,
      type: "card"
    }
    axiosParams = new URLSearchParams()
    Object.keys(getPaymentMethodsParams).forEach((key) => {
      axiosParams.append(key, getPaymentMethodsParams[key])
    })
    response = await axiosInstance.get("https://api.stripe.com/v1/payment_methods", {
      params: axiosParams
    })
    const methodsList: StripeAPI.PaymentMethodsResource = response.data.data

    // 決済の情報を送信
    const paymentIntentParams: StripeAPI.PaymentIntentCreateParams = {
      amount: price,
      currency: "jpy",
      payment_method: methodsList[0].id,
      customer: customer.id,
      transfer_data: {
        destination: creatorId
      },
      application_fee_amount: platformFee,
      description: "ステッカー購入",
      metadata: {
        name: "誰々あてのステッカー",
        price: price
      }
    }
    axiosParams = new URLSearchParams()
    axiosParams.append("amount", paymentIntentParams.amount.toString())
    axiosParams.append("currency", paymentIntentParams.currency)
    axiosParams.append("payment_method", paymentIntentParams.payment_method)
    axiosParams.append("customer", paymentIntentParams.customer)
    axiosParams.append("transfer_data[destination]", paymentIntentParams.transfer_data.destination)
    axiosParams.append(
      "application_fee_amount",
      paymentIntentParams.application_fee_amount.toString()
    )
    axiosParams.append("description", paymentIntentParams.description)
    axiosParams.append(
      "metadata[name]",
      typeof paymentIntentParams.metadata.name === "number"
        ? paymentIntentParams.metadata.name.toString()
        : paymentIntentParams.metadata.name
    )
    axiosParams.append(
      "metadata[price]",
      typeof paymentIntentParams.metadata.price === "number"
        ? paymentIntentParams.metadata.price.toString()
        : paymentIntentParams.metadata.price
    )
    response = await axiosInstance.post("https://api.stripe.com/v1/payment_intents", axiosParams)
    if (response.status !== StatusCodes.OK) {
      setToastType(ToastType.Error)
      setToastMessage(response.data.error)
      setToastState(true)
      console.log(response.data.error)
      setLoading(false)
      return
    }
    const paymentIntent: StripeAPI.PaymentIntent = response.data

    // 決済確定
    const resultCardPayment = await stripe.confirmCardPayment(paymentIntent.client_secret)
    if (resultCardPayment.error) {
      setToastType(ToastType.Error)
      setToastMessage(resultCardPayment.error.message)
      setToastState(true)
      console.log(resultCardPayment.error)
      setLoading(false)
      return
    } else {
      router.replace({ pathname: "/sticker-edit", query: { settlement: true } })
      console.log("決済完了")
    }

    setLoading(false)
  }

  const ErrorMessage = ({ children }) => (
    <div className="ErrorMessage" role="alert">
      <svg width="16" height="16" viewBox="0 0 17 17">
        <path
          fill="#FFF"
          d="M8.5,17 C3.80557963,17 0,13.1944204 0,8.5 C0,3.80557963 3.80557963,0 8.5,0 C13.1944204,0 17,3.80557963 17,8.5 C17,13.1944204 13.1944204,17 8.5,17 Z"
        />
        <path
          fill="#6772e5"
          d="M8.5,7.29791847 L6.12604076,4.92395924 C5.79409512,4.59201359 5.25590488,4.59201359 4.92395924,4.92395924 C4.59201359,5.25590488 4.59201359,5.79409512 4.92395924,6.12604076 L7.29791847,8.5 L4.92395924,10.8739592 C4.59201359,11.2059049 4.59201359,11.7440951 4.92395924,12.0760408 C5.25590488,12.4079864 5.79409512,12.4079864 6.12604076,12.0760408 L8.5,9.70208153 L10.8739592,12.0760408 C11.2059049,12.4079864 11.7440951,12.4079864 12.0760408,12.0760408 C12.4079864,11.7440951 12.4079864,11.2059049 12.0760408,10.8739592 L9.70208153,8.5 L12.0760408,6.12604076 C12.4079864,5.79409512 12.4079864,5.25590488 12.0760408,4.92395924 C11.7440951,4.59201359 11.2059049,4.59201359 10.8739592,4.92395924 L8.5,7.29791847 L8.5,7.29791847 Z"
        />
      </svg>
      {children}
    </div>
  )

  return (
    <>
      <Header />

      <section className="mt-32 mb-20">
        <Toast
          type={toastType}
          text={toastMessage}
          isShow={toastState}
          isShowSetter={setToastState}
        />

        <h2 className="font-bold text-3xl p-5 text-center">決済</h2>
        <div className="container mx-auto">
          <div className="flex items-center justify-center px-5 pb-10 pt-16">
            <div className="xl:w-1/3 lg:w-1/2 md:w-2/3 w-full mx-auto rounded-lg bg-white shadow-xl py-5 px-10 text-gray-700">
              <div className="w-full pt-1 pb-5">
                <div className="text-white overflow-hidden rounded-full w-20 h-20 -mt-16 mx-auto shadow-xl flex justify-center items-center">
                  <Image src="/logo/logo.svg" width={80} height={80} />
                </div>
              </div>
              <div className="mb-6">
                <label className="font-bold text-sm mb-2 ml-1 text-gray">カード番号</label>
                <div>
                  <CardNumberElement className="h-10 w-full px-3 py-2.5 mb-1 border-2 border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>
              <div className="mb-6 -mx-2 flex items-end">
                <div className="px-2 w-1/2">
                  <label className="font-bold text-sm mb-2 ml-1 text-gray">有効期限</label>
                  <CardExpiryElement className="form-select w-full px-3 py-2 mb-1 border-2 border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer" />
                </div>
              </div>
              <div className="mb-8">
                <label className="font-bold text-sm mb-2 ml-1 text-gray">セキュリティコード</label>
                <div>
                  <CardCvcElement className="w-32 px-3 py-2 mb-1 border-2 border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="mb-10 flex justify-between">
                <label className="font-bold text-sm mb-2 ml-1 text-gray">お支払い合計</label>
                <div>
                  <p className="font-bold text-2xl">{`¥${price}`}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto xl:w-1/3 lg:w-1/2 md:w-2/3 w-full">
            <RoundedButton
              isDisabled={!stripe}
              isLoad={loading}
              onClick={handleSubmit}
              text={"支払う"}
              size={RoundedDivSize.M}
            />
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Index
