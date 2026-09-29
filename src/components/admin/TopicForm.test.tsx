import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TopicForm } from "./TopicForm";

vi.mock("@/features/admin/actions", () => ({
  createTopic: vi.fn(),
  updateTopic: vi.fn(),
}));

afterEach(cleanup);

describe("TopicForm", () => {
  it("keeps the generated slug read-only while preserving it on edit", () => {
    const { container } = render(<TopicForm communitySlug="ltc" topic={{ id: "topic-1", slug: "bestehender-slug" }} />);

    const slug = screen.getByLabelText("Slug");
    expect(slug).toBeDisabled();
    expect(slug.parentElement?.parentElement).toHaveAttribute("title", "In dieser Version wird der Slug automatisch erstellt und kann nicht bearbeitet werden.");
    expect(container.querySelector('input[type="hidden"][name="slug"]')).toHaveValue("bestehender-slug");
  });

  it("shows only opinion fields and fixed reactions by default", () => {
    render(<TopicForm communitySlug="ltc" />);

    expect(screen.getByLabelText("Leitfrage")).toBeVisible();
    expect(screen.queryByLabelText("Auswahlmodus")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Konkrete Aufgabe")).not.toBeInTheDocument();
    expect(screen.getByText("Gute Idee")).toBeVisible();
    expect(screen.getByText("Unentschieden")).toBeVisible();
    expect(screen.getByText("Sehe ich kritisch")).toBeVisible();
  });

  it("shows the option editor and selection mode for votes", () => {
    render(<TopicForm communitySlug="ltc" />);
    fireEvent.change(screen.getByLabelText("Topic-Typ"), { target: { value: "vote" } });

    expect(screen.getByLabelText("Leitfrage")).toBeVisible();
    expect(screen.getByLabelText("Auswahlmodus")).toBeVisible();
    expect(screen.getByLabelText("Antwortoption 1")).toBeVisible();
    expect(screen.getByLabelText("Antwortoption 2")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Option hinzufügen" }));
    expect(screen.getByLabelText("Antwortoption 3")).toBeVisible();
  });

  it("shows only the collaboration task, event period and fixed reactions", () => {
    render(<TopicForm communitySlug="ltc" />);
    fireEvent.change(screen.getByLabelText("Topic-Typ"), { target: { value: "collaboration" } });

    expect(screen.getByLabelText("Konkrete Aufgabe")).toBeVisible();
    expect(screen.getByLabelText("Termin beginnt")).toBeVisible();
    expect(screen.getByLabelText("Termin endet")).toBeVisible();
    expect(screen.queryByLabelText("Leitfrage")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Auswahlmodus")).not.toBeInTheDocument();
    expect(screen.getByText("Ich bin dabei")).toBeVisible();
    expect(screen.getByText("Vielleicht")).toBeVisible();
  });

  it("shows information reactions without participation fields", () => {
    render(<TopicForm communitySlug="ltc" />);
    fireEvent.change(screen.getByLabelText("Topic-Typ"), { target: { value: "information" } });

    expect(screen.queryByLabelText("Leitfrage")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Beteiligung")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Beteiligung endet")).not.toBeInTheDocument();
    expect(screen.getByText("Gelesen")).toBeVisible();
    expect(screen.getByText("Danke")).toBeVisible();
    expect(screen.getByText("Interessiert mich")).toBeVisible();
  });
});
