/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WalletBalanceDisplay from "./WalletBalanceDisplay";

describe("WalletBalanceDisplay", () => {
  it("should render loading state when fetching is true", () => {
    render(<WalletBalanceDisplay fetching={true} walletBalance={null} insufficient={false} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should have loading animation class", () => {
    render(<WalletBalanceDisplay fetching={true} walletBalance={null} insufficient={false} />);
    const loading = screen.getByText("Loading...");
    expect(loading).toHaveClass("animate-pulse");
  });

  it("should render dash when walletBalance is null and not fetching", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={null} insufficient={false} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("should render balance when walletBalance is provided", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={100} insufficient={false} />);
    expect(screen.getByText("100 tokens")).toBeInTheDocument();
  });

  it("should render insufficient balance in red", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={50} insufficient={true} />);
    const balance = screen.getByText("50 tokens");
    expect(balance).toHaveClass("text-red-500");
  });

  it("should render sufficient balance in blue", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={100} insufficient={false} />);
    const balance = screen.getByText("100 tokens");
    expect(balance).toHaveClass("text-blue-900");
  });

  it("should have font-bold class for balance", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={100} insufficient={false} />);
    const balance = screen.getByText("100 tokens");
    expect(balance).toHaveClass("font-bold");
  });

  it("should have text-xs class for balance", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={100} insufficient={false} />);
    const balance = screen.getByText("100 tokens");
    expect(balance).toHaveClass("text-xs");
  });

  it("should render zero balance", () => {
    render(<WalletBalanceDisplay fetching={false} walletBalance={0} insufficient={true} />);
    expect(screen.getByText("0 tokens")).toBeInTheDocument();
  });
});
