import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  IconShield,
  IconCheck,
  IconX,
  IconDoc,
  IconEye,
  IconPhone,
  IconBriefcase,
  IconUser,
  IconSearch,
  IconFilter,
  IconClose,
  IconExternalLink,
  IconStar,
} from "./VerificationIcons";

describe("VerificationIcons", () => {
  it("should render IconShield correctly with its default attributes", () => {
    const { container } = render(<IconShield />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("should render IconCheck with default size attribute when no size prop is specified", () => {
    const { container } = render(<IconCheck />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should render IconCheck with a custom size attribute when size prop is provided", () => {
    const { container } = render(<IconCheck size={24} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("should render IconX with default size attribute when no size prop is specified", () => {
    const { container } = render(<IconX />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should render IconX with a custom size attribute when size prop is provided", () => {
    const { container } = render(<IconX size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("should render IconDoc correctly with its default attributes", () => {
    const { container } = render(<IconDoc />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should render IconEye correctly with its default attributes", () => {
    const { container } = render(<IconEye />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
  });

  it("should render IconPhone correctly with its default attributes", () => {
    const { container } = render(<IconPhone />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
  });

  it("should render IconBriefcase correctly with its default attributes", () => {
    const { container } = render(<IconBriefcase />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
  });

  it("should render IconUser correctly with its default attributes", () => {
    const { container } = render(<IconUser />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
  });

  it("should render IconSearch correctly with its default attributes", () => {
    const { container } = render(<IconSearch />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should render IconFilter correctly with its default attributes", () => {
    const { container } = render(<IconFilter />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "15");
    expect(svg).toHaveAttribute("height", "15");
  });

  it("should render IconClose correctly with its default attributes", () => {
    const { container } = render(<IconClose />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("should render IconExternalLink correctly with its default attributes", () => {
    const { container } = render(<IconExternalLink />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "13");
    expect(svg).toHaveAttribute("height", "13");
  });

  it("should render IconStar correctly with its default attributes", () => {
    const { container } = render(<IconStar />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "13");
    expect(svg).toHaveAttribute("height", "13");
  });
});
