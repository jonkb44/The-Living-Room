import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RoomCard from "@/components/RoomCard";
import { sampleRooms } from "@/lib/sampleData";

describe("RoomCard", () => {
  it("renders the room name and a friendly empty-room message", () => {
    render(<RoomCard room={sampleRooms[0]} presentCount={0} />);
    expect(screen.getByText(sampleRooms[0].name)).toBeInTheDocument();
    expect(screen.getByText(/quietly empty/i)).toBeInTheDocument();
  });

  it("shows a people count when others are present", () => {
    render(<RoomCard room={sampleRooms[0]} presentCount={3} />);
    expect(screen.getByText(/3 people here/i)).toBeInTheDocument();
  });
});
