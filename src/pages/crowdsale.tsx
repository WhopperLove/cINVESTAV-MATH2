import React, { useEffect, useRef } from "react";
import { ethers } from "ethers";
import moment from "moment";
import { BigNumber } from "ethers/utils";
import { TacoTokenFactory } from "../types/TacoTokenFactory";
import { TacosCrowdsaleFactory } from "../types/TacosCrowdsaleFactory";
import { TacoToken } from "../types/TacoToken";
import { TacosCrowdsale } from "../types/TacosCrowdsale";
import {
  Flex,
  Button,
  Stack,
  Text,
  Image,
  Divider,
  Spinner,
  Progress,
  Badge,
  StatGroup,
  StatLabel,
  StatHelpText,
  StatNumber,
  Stat,
  Input,
} from "@chakra-ui/core";
import LoadingTacos from "../components/LoadingTacos";
import { Global } from "@emotion/core";
import customTheme from "../lib/theme";
import Head from "next/head";
import { TransactionResponse } from "ethers/providers";

const fetchInterval = 5000; // 5 seconds

export type TaqueroStat = {
  address: string;
  timesCrunched: BigNumber;
  tacosCrunched: BigNumber;
  0: BigNumber;
  1: BigNumber;
};

const truncate = (str, maxDecimalDigits) => {
  if (str.includes(".")) {
    const parts = str.split(".");
    return parts[0] + "." + parts[1].slice(0, maxDecimalDigits);
  }
  return str;
};

const truncateAddress = (str) => {
  return str.slice(0, 5) + "..." + str.slice(38, 42);
};

const variantColorForRound = (round) => {
  if (round == "Cooks") {
    return "purple";
  } else if (round == "Karma") {
    return "blue";
  } else {
    return "green";
  }
};

function useInterval(callback: Function, delay: number) {
  const savedCallback = useRef<any>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback?.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Crowdsale = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isFetchingFirstTime, setIsFetchingFirstTime] = React.useState<boolean>(true);
  const [isPurchasing, setIsPurchasing] = React.useState<boolean>(false);

  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider>(null);
  const [signer, setSigner] = React.useState<ethers.providers.JsonRpcSigner>(null);
  const [address, setAddress] = React.useState<string>("0x0");
  const [ethBalance, setEthBalance] = React.useState<string>("0");
  const [tacosCrowdsale, setTacosCrowdsale] = React.useState<TacosCrowdsale | null>(null);
  const [tacoToken, setTacoToken] = React.useState<TacoToken | null>(null);

  const [tacoBalance, setTacoBalance] = React.useState<string>("0");
  const [amountToBuy, setAmountToBuy] = React.useState<string>(0);
  const [hardcap, setHardcap] = React.useState<string>("");
  const [weiRaised, setWeiRaised] = React.useState<string>("");
  const [capPerAddress, setCapPerAddress] = React.useState<string>("");
  const [contributions, setContributions] = React.useState<string>("");
  const [currentRound, setCurrentRound] = React.useState<string>("");
  const [tacosPerEth, setTacosPerEth] = React.useState<number>(0);
  const [liquidityLocked, setLiquidityLocked] = React.useState<boolean>(false);

  const handleFirstLoad = async () => {
    await (window as any).ethereum.enable();
    const provider = new ethers.providers.Web3Provider((window as any).web3.currentProvider);
    // ⭐️ After user is successfully authenticated
    setProvider(provider);
    const signer = provider.getSigner();
    setSigner(signer);
    const address = await signer.getAddress();
    setAddress(address);

    const tacosCrowdsale = await TacosCrowdsaleFactory.connect(
      process.env.NEXT_PUBLIC_TACOSCROWDSALE_CONTRACT_ADDRESS,
      signer
    );
    setTacosCrowdsale(tacosCrowdsale);

    const tacoToken =