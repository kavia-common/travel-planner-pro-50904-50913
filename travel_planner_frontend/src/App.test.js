import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders trips sidebar header", () => {
  render(<App />);
  const tripsHeader = screen.getByText(/Trips/i);
  expect(tripsHeader).toBeInTheDocument();
});
