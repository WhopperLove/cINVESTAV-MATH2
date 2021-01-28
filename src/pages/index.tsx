import React, { Fragment, useEffect, useRef } from "react";
import { TacoTokenFactory } from "../types/TacoTokenFactory";
import { ethers } from "ethers";
import { TacoToken } from "../types/TacoToken";
import moment from "moment";
import { BigNumber } from "ethers/utils";
import { Box, useTheme, Flex, Icon, Text, Stack, Divider, PseudoBox, Image, Spinner } from "@chakra-ui/core";
import { Global } from "@emotion/core";
import customTheme from "../lib/theme";
import Head from "next/head";
import LoadingTacos from "../components/LoadingTacos";

const fetchInterval = 3000; // 3 seconds

export type TaqueroStat = {
  address: string;
  timesCrunched: BigNumber;
  tacosCrunched: BigNumber;
  0: BigNumber;
  1: BigNumber;
};

export type InfoFor = {
  balance: BigNumber;
  poolBalance: BigNumber;
  totalSupply: BigNumber;
  totalTacosCrunched: BigNumber;
  crunchableTacos: BigNumber;
  lastCrunchAt: BigNumber;
  timesCrunched: BigNumber;
  tacosCrunched: BigNumber;
  tacoTuesday: boolean;
  tacosCrunchRate: BigNumber;
  taqueroRewardRate: BigNumber;
  tacoTuesdayMultiplier: BigNumber;
};

function truncate(str, maxDecimalDigits) {
  if (str.includes(".")) {
    const parts = str.split(".");
    return parts[0] + "." + parts[1].slice(0, maxDecimalDigits);
  }
  return str;
}

const truncateAddress = (str) => {
  return str.slice(0, 5) + "..." + str.slice(38, 42);
};

function HomePage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isFetchingFirstTime, setIsFetchingFirstTime] = React.useState<boolean>(true);
  const [isCrunchLoading, setIsCrunchLoading] = React.useState<boolean>(false);
  // const [isPurchasing, setIsPurchasing] = React.useState<boolean>(false);

  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider>(null);
  const [signer, setSigner] = React.useState<ethers.providers.JsonRpcSigner>(null);
  const [address, setAddress] = React.useState<string>("0x0");

  const [tacoToken, setTacoToken] = React.useState<TacoToken | null>(null);
  const [isTacoTuesday, setIsTacoTuesday] = React.useState<boolean>(false);
  const [rewardMultiplier, setRewardMultiplier] = React.useState<number>(1);
  const [lastCrunchTime, setLastCrunchTime] = React.useState<number>(0);
  const [tacosCrunchedleaderboard, setTacosCrunchedLeaderboard] = React.useState<TaqueroStat[]>([]);
  const [timesCrunchedLeaderboard, setTimesCrunchedLeaderboard] = React.useState<TaqueroStat[]>([]);
  const [infoFor, setInfoFor] = React.useState<InfoFor | null>(null);
  const [isOwner, setIsOwner] = React.useState<boolean>(false);

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

  const handleFirstLoad = async () => {
    window.addEventListener("load", async () => {
      try {
        // Request full provider if needed
        // Full provider exposed
        await (window as any).ethereum.enable();
        const provider = new ethers.providers.Web3Provider((window as any).web3.currentProvider);
        // ⭐️ After user is successfully authenticated

        setProvider(provider);
        const signer = provider.getSigner();
        setSigner(sign