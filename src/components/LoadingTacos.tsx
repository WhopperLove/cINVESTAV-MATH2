import { Box, Flex, Text, Image } from "@chakra-ui/core";
import Head from "next/head";
import { Global } from "@emotion/core";
import customTheme from "../lib/theme";

const LoadingTacos: React.FC<{ variant?: "Crowdsale" }> = ({ variant = "Portal" }) => (
  <Box>
    <Head>
      <title>Taco {variant}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      <link
      