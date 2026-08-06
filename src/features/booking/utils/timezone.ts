export const PARIS_TIME_ZONE = "Europe/Paris";

/*
 * Décalage (en millisecondes) entre l'heure de Paris et l'UTC à un
 * instant donné, calculé via l'API Intl plutôt qu'une table de
 * décalages fixes afin de gérer automatiquement les changements
 * d'heure été/hiver.
 */
export function getParisOffsetMilliseconds(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

/*
 * Convertit une date + heure locale de Paris (déjà validées au
 * format "YYYY-MM-DD" / "HH:mm" par l'appelant) en instant UTC.
 */
export function parisLocalDateTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);

  const [hour, minute] = time.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  let offset = getParisOffsetMilliseconds(utcGuess);

  let result = new Date(utcGuess.getTime() - offset);

  const correctedOffset = getParisOffsetMilliseconds(result);

  if (correctedOffset !== offset) {
    offset = correctedOffset;

    result = new Date(utcGuess.getTime() - offset);
  }

  return result;
}
