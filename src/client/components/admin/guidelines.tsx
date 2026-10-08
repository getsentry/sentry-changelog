import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout, Card, Heading, Text } from "@radix-ui/themes";

export const POST_GUIDELINES = [
  'Be very matter of fact, direct, and simple. Avoid using words like "excited to announce".',
  "Spell out the what, the why, and how to use it.",
  "Avoid exclamation points, adjectives, references to competition, and personal opinions.",
];

export function GuidelinesCallout() {
  return (
    <Callout.Root color="gray" variant="surface" size="1">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <div className="text-sm text-[var(--gray-11)]">
        <Text weight="medium" className="text-[var(--gray-12)]">
          Writing guidelines
        </Text>
        <ul className="mt-1 list-disc pl-4 space-y-0.5">
          {POST_GUIDELINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </Callout.Root>
  );
}

export function GuidelinesCard() {
  return (
    <Card size="2">
      <Heading as="h3" size="2" mb="2">
        Writing guidelines
      </Heading>
      <ul className="list-disc pl-4 space-y-1.5">
        {POST_GUIDELINES.map((line) => (
          <li key={line}>
            <Text size="1" color="gray">
              {line}
            </Text>
          </li>
        ))}
      </ul>
    </Card>
  );
}
