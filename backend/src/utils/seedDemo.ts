import { Campsite, User } from "../models";
import { logger } from "./logger";

export async function seedDemoData() {
  const campsiteCount = await Campsite.count();
  if (campsiteCount > 0) {
    logger.info("Skipping demo seed; campsites already exist");
    return;
  }

  const [host] = await User.findOrCreate({
    where: { firebaseUid: "demo-host" },
    defaults: {
      firebaseUid: "demo-host",
      email: "host@example.com",
      name: "Demo Host",
      role: "host",
    },
  });

  const samples = [
    {
      name: "Solbaram Camp",
      description: "Lakeside camping with power and wifi.",
      location: "춘천시 남산면",
      pricePerNight: 65000,
      hostId: host.id,
    },
    {
      name: "Starlight Glamping",
      description: "Glamping tents with BBQ set included.",
      location: "가평군 상면",
      pricePerNight: 90000,
      hostId: host.id,
    },
    {
      name: "Wave Sound Auto Camp",
      description: "Ocean-view auto campsite, pet friendly.",
      location: "부산 기장군",
      pricePerNight: 75000,
      hostId: host.id,
    },
  ];

  for (const sample of samples) {
    await Campsite.findOrCreate({
      where: { name: sample.name },
      defaults: sample,
    });
  }

  logger.info("Demo seed inserted (3 campsites)");
}
