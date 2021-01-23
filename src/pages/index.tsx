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
  add