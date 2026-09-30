import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TopicForm } from "./TopicForm";

vi.mock("@/features/admin/actions", () => ({
  createTopic: vi.fn(),
  updateTopic: vi.fn(),
}));

afterEach(cleanup);

describe("TopicForm", () => {
  it("uses the tenant visibility label and explains both scopes", () => {
    render(<TopicForm
      communitySlug="ltc"
      communityVisibilityLabel="Nur für Mitglieder"
      communityVisibilityHelpText="nur für angemeldete Mitglieder des LTC lesbar."
    />);

    expect(screen.getByRole("option", { name: "Nur für Mitglieder" })).toBeInTheDocument();
    const help = screen.getByLabelText("Bedeutung der Sichtbarkeit");
    expect(help).toHaveAttribute("tabindex", "0");
    expect(within(help).getByRole("tooltip")).toHaveTextContent("Öffentlich: ohne Anmeldung lesbar.");
    expect(within(help).getByRole("tooltip")).toHaveTextContent("Nur für Mitglieder: nur für angemeldete Mitglieder des LTC lesbar.");
  });

  it("keeps the topic slug internal while preserving it on edit", () => {
    const { container } = render(<TopicForm communitySlug="ltc" topic={{ id: "topic-1", slug: "bestehender-slug" }} />);

    expect(screen.queryByLabelText("Slug")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="hidden"][name="topicSlug"]')).toHaveValue("bestehender-slug");
  });

  it("shows only opinion fields and fixed reactions by default", () => {
    render(<TopicForm communitySlug="ltc" />);

    expect(screen.getByLabelText("Bedeutung von Titel")).toBeInTheDocument();
    expect(screen.getByLabelText("Bedeutung von Leitfrage")).toBeInTheDocument();
    expect(screen.getByText(/Die Überschrift des Topics/)).toBeInTheDocument();
    expect(screen.getByText(/Die konkrete Frage, auf die sich die Reaktion bezieht/)).toBeInTheDocument();
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

  it("limits votes to seven answer options", () => {
    render(<TopicForm communitySlug="ltc" />);
    fireEvent.change(screen.getByLabelText("Topic-Typ"), { target: { value: "vote" } });

    const addButton = screen.getByRole("button", { name: "Option hinzufügen" });
    for (let index = 0; index < 5; index += 1) fireEvent.click(addButton);

    expect(screen.getByLabelText("Antwortoption 7")).toBeVisible();
    expect(addButton).toBeDisabled();
    expect(screen.queryByLabelText("Antwortoption 8")).not.toBeInTheDocument();
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
