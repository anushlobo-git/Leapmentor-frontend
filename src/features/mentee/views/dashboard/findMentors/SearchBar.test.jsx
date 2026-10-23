import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("renders input field with search icon", () => {
    render(
      <SearchBar
        skill=""
        setSkill={() => {}}
        totalCount={0}
        hasSearched={false}
      />,
    );
    expect(
      screen.getByPlaceholderText(
        /Search by skill or name — e.g. React, John.../i,
      ),
    ).toBeInTheDocument();
  });

  it("calls setSkill on text input change", async () => {
    const setSkillMock = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchBar
        skill=""
        setSkill={setSkillMock}
        totalCount={10}
        hasSearched={true}
      />,
    );

    const input = screen.getByPlaceholderText(
      /Search by skill or name — e.g. React, John.../i,
    );
    await user.type(input, "React");
    expect(setSkillMock).toHaveBeenCalled();
  });

  it("shows clear button when skill value is not empty and clears the value on click", async () => {
    const setSkillMock = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchBar
        skill="React"
        setSkill={setSkillMock}
        totalCount={10}
        hasSearched={true}
      />,
    );

    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(setSkillMock).toHaveBeenCalledWith("");
  });
});
