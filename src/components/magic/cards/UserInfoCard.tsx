import { useCallback, useEffect, useMemo, useState } from "react"
import Divider from "@/components/ui/Divider"
import { LoginProps } from "@/utils/types"
import { logout } from "@/utils/common"
import { useMagic } from "../MagicProvider"
import Card from "@/components/ui/Card"
import CardHeader from "@/components/ui/CardHeader"
import CardLabel from "@/components/ui/CardLabel"
import Spinner from "@/components/ui/Spinner"
import { getNetworkName, getNetworkToken } from "@/utils/network"
import { useAlchemyProvider } from "../AlchemyProvider"

const UserInfo = ({ token, setToken }: LoginProps) => {
  const { magic, web3 } = useMagic()
  const [magicBalance, setMagicBalance] = useState("...")
  const [scaBalance, setScaBalance] = useState("...")
  const [copied, setCopied] = useState("Copy")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [magicAddress] = useState(localStorage.getItem("user"))
  const [scaAddress, setScaAddress] = useState("")

  const { provider } = useAlchemyProvider()

  const getSmartContractAccount = useCallback(async () => {
    const aaAccount = await provider.account?.getAddress()
    setScaAddress(aaAccount as `0x${string}`)
  }, [provider])

  useEffect(() => {
    getSmartContractAccount()
  }, [provider, provider.account, getSmartContractAccount])

  const getBalance = useCallback(async () => {
    if (magicAddress && web3) {
      const magicBalance = await web3.eth.getBalance(magicAddress)
      if (magicBalance == BigInt(0)) {
        setMagicBalance("0")
      } else {
        setMagicBalance(web3.utils.fromWei(magicBalance, "ether"))
      }
    }
    if (scaAddress && web3) {
      const aaBalance = await web3.eth.getBalance(scaAddress)
      if (aaBalance == BigInt(0)) {
        setScaBalance("0")
      } else {
        setScaBalance(web3.utils.fromWei(aaBalance, "ether"))
      }
    }
  }, [web3, magicAddress, scaAddress])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    await getBalance()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }, [getBalance])

  useEffect(() => {
    if (web3) {
      refresh()
    }
  }, [web3, refresh])

  useEffect(() => {
    setMagicBalance("...")
    setScaBalance("...")
  }, [magic])

  const disconnect = useCallback(async () => {
    if (magic) {
      await logout(setToken, magic)
    }
  }, [magic, setToken])

  const copy = useCallback(() => {
    if (magicAddress && copied === "Copy") {
      setCopied("Copied!")
      navigator.clipboard.writeText(magicAddress)
      setTimeout(() => {
        setCopied("Copy")
      }, 1000)
    }
  }, [copied, magicAddress])

  return (
    <Card>
      <CardHeader id="Wallet">Wallet</CardHeader>
      <CardLabel
        leftHeader="Status"
        rightAction={<div onClick={disconnect}>Disconnect</div>}
        isDisconnect
      />
      <div className="flex-row">
        <div className="green-dot" />
        <div className="connected">Connected to {getNetworkName()}</div>
      </div>
      <Divider />
      <CardLabel
        leftHeader="Addresses"
        rightAction={
          !magicAddress ? <Spinner /> : <div onClick={copy}>{copied}</div>
        }
      />
      <div className="flex flex-col gap-2">
        <div className="code">
          Magic:{" "}
          {magicAddress?.length == 0 ? "Fetching address..." : magicAddress}
        </div>
        <div className="code">
          Smart Contract Account:{" "}
          {scaAddress?.length == 0 ? "Fetching address..." : scaAddress}
        </div>
      </div>
      <Divider />
      <CardLabel
        leftHeader="Balance"
        rightAction={
          isRefreshing ? (
            <div className="loading-container">
              <Spinner />
            </div>
          ) : (
            <div onClick={refresh}>Refresh</div>
          )
        }
      />
      <div className="flex flex-col gap-2">
        <div className="code">
          Magic: {magicBalance.substring(0, 7)} {getNetworkToken()}
        </div>
        <div className="code">
          AA: {scaBalance.substring(0, 7)} {getNetworkToken()}
        </div>
      </div>
    </Card>
  )
}

export default UserInfo
