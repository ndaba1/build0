import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  username?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}

const baseUrl = process.env.ASSETS_URL
  ? `https://${process.env.ASSETS_URL}`
  : "";

export const VercelInviteUserEmail = ({
  username,
  userImage,
  invitedByUsername,
  invitedByEmail,
  teamName,
  teamImage,
  inviteLink,
  inviteFromIp,
  inviteFromLocation,
}: VercelInviteUserEmailProps) => {
  const previewText = `Welcome to BuildZero!`;

  const steps = [
    {
      id: 1,
      Description: (
        <li className="mb-8 leading-snug" key={1}>
          <strong>Create your first template.</strong>{" "}
          <Link>Visit the docs</Link> to learn what a template is and how you
          can create your first one.
        </li>
      ),
    },
    {
      id: 2,
      Description: (
        <li className="mb-8 leading-snug" key={2}>
          <strong>Install the Typescript SDK</strong> The Typescript SDK offers
          a fully typesafe experience for passing data to your templates.{" "}
          <Link>Get Started</Link>.
        </li>
      ),
    },
    {
      id: 3,
      Description: (
        <li className="mb-8 leading-snug" key={3}>
          <strong>Create your first document</strong> Use the REST API/ SDK to
          create a new pdf from your template <Link>View Documents</Link>.
        </li>
      ),
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border-none border-[#eaeaea] rounded-md my-[40px] mx-auto p-[20px] max-w-[520px]">
            <Section className="mt-[32px]">
              <Img
                src="https://assets.build0.dev/logo.png"
                width="72"
                height="72"
                alt="BuildZero"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to BuildZero!
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">
                  Congratulations! You're on your way to creating all sorts of complex
                  pdf documents, hassle-free - and actually enjoy it!
                </Text>

                <Text className="text-base">Here's how to get started:</Text>
              </Row>
            </Section>

            <ul>{steps?.map(({ Description }) => Description)}</ul>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href="https://app.build0.dev"
              >
                Get Started
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was intended for{" "}
              <span className="text-black">{username}</span>. If you were not
              expecting this email, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VercelInviteUserEmail.PreviewProps = {
  username: "alanturing",
  userImage: `${baseUrl}/static/vercel-user.png`,
  invitedByUsername: "Alan",
  invitedByEmail: "alan.turing@example.com",
  teamName: "Enigma",
  teamImage: `${baseUrl}/static/vercel-team.png`,
  inviteLink: "https://vercel.com/teams/invite/foo",
  inviteFromIp: "204.13.186.218",
  inviteFromLocation: "São Paulo, Brazil",
} as VercelInviteUserEmailProps;

export default VercelInviteUserEmail;
