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
  const [isFetchingFirstTime, setIsFetchingFirstTime] = React.useState<bool