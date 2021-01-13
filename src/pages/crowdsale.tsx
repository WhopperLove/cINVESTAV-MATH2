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
  1: 