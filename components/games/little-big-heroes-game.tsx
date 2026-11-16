"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";
import { CharacterAvatar } from "@/components/character-avatar";

const heroes = [
  { name: "Rosa y morado", avatarKey: "vida-kids-01-rosa-morado" },
  { name: "Camiseta blanca", avatarKey: "vida-kids-02-blanco" },
  { name: "Sudadera azul", avatarKey: "vida-kids-03-azul" },
  { name: "Camiseta beige", avatarKey: "vida-kids-04-beige" },
  { name: "Camiseta verde", avatarKey: "vida-kids-05-verde" },
  { name: "Camiseta roja", avatarKey: "vida-kids-06-rojo" },
];
