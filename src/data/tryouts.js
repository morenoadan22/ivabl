export const tryoutConfig = {
  fee: 10,
  teamFee: 50,
  tryoutDate: "October 17th",
  tryoutWindow: "October 17th",
  tryoutDateTBD: "October 17th — 9–11 AM",
  tryoutTime: "9–11 AM",
  seasonWindow: "Season Starts October 31st",
  feeNote: "$10 sign-up fee will go towards $50 team fee once selected or team is formed.",
  locationName: "Sunflower Field",
  locationAddress: "2299 W Adams",
  locationCity: "El Centro, CA 92243",
  locationTBD: "Sunflower Field — 2299 W Adams, El Centro, CA 92243",
  contactName: "Ridge McCurry",
  contactEmail: "morenoadan22@gmail.com",
  // Payment options — display only, not clickable (update handles here)
  payments: [
    {
      id: "venmo",
      label: "Venmo",
      handle: "@Adan-Moreno-1",
      instructions: "Add your full name + “Tryout” in the note",
      highlight: true,
    },
    {
      id: "zelle",
      label: "Zelle",
      handle: "760-970-7560",
      instructions: "Send via Zelle to phone — include your full name + “Tryout”",
    },
    {
      id: "cash",
      label: "Cash at Tryouts",
      handle: "Pay in person — $10 cash at check-in",
      instructions: "Exact cash preferred — select “Cash at check-in” in the form and bring $10 on Oct 17, 9–11 AM",
    },
  ],
  // Interest form — Formspree.
  formAction: "https://formspree.io/f/xwvjleog",
  formSubject: "IVABL Tryout – Interest Signup",
};
