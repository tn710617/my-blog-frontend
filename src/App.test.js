/* eslint-disable import/first */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

// Mock Layout to avoid importing Nav and API-related modules
vi.mock("./Components/Layout", () => ({
  default: () => React.createElement("div", null, "Layout")
}))
vi.mock("./Pages/Posts", () => ({
  default: () => React.createElement("div", null, "Posts")
}))
vi.mock("./Pages/SinglePost", () => ({
  default: () => React.createElement("div", null, "SinglePost")
}))
vi.mock("./Pages/CreatePost", () => ({
  default: () => React.createElement("div", null, "CreatePost")
}))
vi.mock("./Pages/EditPost", () => ({
  default: () => React.createElement("div", null, "EditPost")
}))
vi.mock("./Components/ProtectedRoute", () => ({
  default: () => React.createElement("div", null, "ProtectedRoute")
}))
vi.mock("./Pages/About", () => ({
  default: () => React.createElement("div", null, "About")
}))

import App from "./App"

test("renders Layout without heavy dependencies", () => {
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(App)
    )
  )
  
  expect(screen.getByText("Layout")).toBeInTheDocument()
})
