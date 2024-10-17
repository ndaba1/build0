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

interface BuildZeroVerifyEmailProps {
  username?: string;
  verificationCode?: string;
}

export const BuildZeroVerifyEmail = ({
  username,
  verificationCode,
}: BuildZeroVerifyEmailProps) => {
  const previewText = `Verify your BuildZero account`;

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
              Verify your email address
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">
                  Please enter the following verification code when prompted, to
                  complete setting up your account.
                </Text>
              </Row>

              <Section className="flex items-center justify-center">
                <Text className="text-[#333] text-center text-base font-medium">
                  Verification code
                </Text>

                <Text className="font-bold text-4xl my-8 text-center">
                  {verificationCode}
                </Text>
              </Section>

              <Text>
                This is a one-time verification. Your verification code will
                expire in 10 minutes after which it will need to be resent.
              </Text>
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

BuildZeroVerifyEmail.PreviewProps = {
  username: "allen",
  verificationCode: "123456",
} as BuildZeroVerifyEmailProps;

export default BuildZeroVerifyEmail;
