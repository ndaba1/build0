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

interface BuildZeroInviteUserEmailProps {
  username?: string;
  password?: string;
}

export const BuildZeroInviteUserEmail = ({
  username,
  password,
}: BuildZeroInviteUserEmailProps) => {
  const previewText = `You have been invited to join BuildZero!`;

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
              Join your team on BuildZero
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">
                  You have been invited to join your team on BuildZero. Your
                  login details are:
                </Text>
              </Row>

              <Row className="flex flex-col gap-2">
                <Text className="text-base"><span className="font-semibold">Username:</span> {username}</Text>
                <Text className="text-base"><span className="font-semibold">Password:</span> {password}</Text>
              </Row>

              <Text>
                The provided password is temporary and you will be prompted to
                change it upon your first login. It will expire in 24 hours
                after which your invitation will need to be resent.
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href="https://app.build0.dev"
              >
                Go to Dashboard
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

BuildZeroInviteUserEmail.PreviewProps = {
  username: "alanturing",
  password: "password",
} as BuildZeroInviteUserEmailProps;

export default BuildZeroInviteUserEmail;
