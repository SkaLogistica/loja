import NextHead from "next/head";

interface Props {
  title?: string;
  description?: string;
};

export const Head: React.FC<Props> = ({ title, description }) => {
  const defaultProps = {
    title: "Loja SKA Distribuição",
    description: "loja de material de construções",
  } as Props;

  return (
    <NextHead>
      <title>{title ?? defaultProps.title}</title>
      <meta
        name="description"
        content={description ?? defaultProps.description}
      />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
};
