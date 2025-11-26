import { initDatabase, Campsite, User } from "../models";
import { logger } from "../utils/logger";

async function main() {
  await initDatabase();

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
      location: "Chuncheon, Gangwon",
      pricePerNight: 65000,
      hostId: host.id,
    },
    {
      name: "Starlight Glamping",
      description: "Glamping tents with BBQ set included.",
      location: "Gapyeong, Gyeonggi",
      pricePerNight: 90000,
      hostId: host.id,
    },
    {
      name: "Wave Sound Auto Camp",
      description: "Ocean-view auto campsite, pet friendly.",
      location: "Busan, Gijang",
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

  logger.info("Seed completed");
  process.exit(0);
}

main().catch((err) => {
  logger.error("Seed failed", { err });
  process.exit(1);
});
