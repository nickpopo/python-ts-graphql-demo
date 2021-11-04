import { Field, notEmptyString, useField, useForm } from "@shopify/react-form";
import type { NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
import {
  useAddLocationMutation,
  useAddTaskMutation,
  useTasksQuery,
  useLocationsQuery,
} from "../graphql";

const Pill: React.FC = ({ children }) => (
  <div className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-[#0085FF] text-white">
    {children}
  </div>
);

const Input: React.FC<{
  field: Field<string>;
  placeholder?: string;
  disabled?: boolean;
}> = ({ field, placeholder, disabled = false }) => (
  <>
    <input
      className={`w-full rounded-xl bg-slate-100 p-3 text-xl ${
        field.error && "bg-pink-200 text-pink-700 placeholder-pink-300"
      } ${disabled && "opacity-30"}`}
      disabled={disabled}
      placeholder={placeholder}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
    {field.error && (
      <div className="text-sm mt-2 text-red-500 inset-x-0">{field.error}</div>
    )}
  </>
);

const Locations: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ["Location"] }), []);
  const [{ data, fetching }] = useLocationsQuery({ context });
  if (fetching) return <div>Loading</div>;
  if (data?.locations.length === 0) return <div>No locations yet</div>;
  return (
    <div className="flex flex-wrap space-x-1">
      {data?.locations.map(({ name }, index) => (
        <Pill key={index}>{name}</Pill>
      ))}
    </div>
  );
};

const Tasks: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ["Task"] }), []);
  const [{ data, fetching }] = useTasksQuery({ context });
  if (fetching) return <div>Loading</div>;
  if (data?.tasks.length === 0) return <div>No tasks yet</div>;
  return (
    <div className="flex flex-wrap space-x-1">
      {data?.tasks.map(({ name, location }, index) => (
        <Pill key={index}>
          {name} {location && `at ${location.name}`}
        </Pill>
      ))}
    </div>
  );
};

const AddLocation: React.FC = () => {
  const [{ fetching }, mutation] = useAddLocationMutation();

  const {
    fields: { name },
    submit,
    reset,
  } = useForm({
    fields: {
      name: useField({
        value: "",
        validates: notEmptyString("This field is required"),
      }),
    },
    onSubmit: async ({ name }) => {
      const { data } = await mutation({ name });
      if (data?.addLocation.__typename === "LocationExists")
        return {
          status: "fail",
          errors: [{ message: data.addLocation.message, field: ["name"] }],
        };
      reset();
      return { status: "success" };
    },
  });

  return (
    <form onSubmit={submit} className="py-4" name="locations">
      <div className="my-4">
        <div className="text-xs mb-1 text-gray-500 font-medium">Locations</div>
        <Locations />
      </div>
      <Input field={name} disabled={fetching} placeholder="New location name" />
    </form>
  );
};

const AddTask: React.FC = () => {
  const [{ fetching }, mutation] = useAddTaskMutation();

  const {
    fields: { name, locationName },
    submit,
    reset,
  } = useForm({
    fields: {
      name: useField({
        value: "",
        validates: notEmptyString("This field is required"),
      }),
      locationName: useField(""),
    },
    makeCleanAfterSubmit: false,
    onSubmit: async ({ name, locationName }) => {
      const { data } = await mutation({ name, locationName });
      if (data?.addTask.__typename === "LocationNotFound")
        return {
          status: "fail",
          errors: [{ message: data.addTask.message, field: ["locationName"] }],
        };
      reset();
      return { status: "success" };
    },
  });

  return (
    <>
      <div className="my-4">
        <div className="text-xs mb-1 text-gray-500 font-medium">Tasks</div>
        <Tasks />
      </div>
      <form onSubmit={submit} className="flex space-x-2" name="tasks">
        <div className="flex-grow">
          <Input field={name} disabled={fetching} placeholder="New task" />
        </div>
        <div className="w-1/3">
          <Input
            field={locationName}
            disabled={fetching}
            placeholder="Location"
          />
        </div>
        <button className="overflow-hidden w-0" type="submit">
          Submit
        </button>
      </form>
    </>
  );
};

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Mini Inch</title>
        <meta
          name="description"
          content="Generated by the Inch team for teaching purposes"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col justify-center">
        <h1 className="text-4xl md:text-7xl md:leading-loose md:text-center font-extrabold">
          Mini Inch
        </h1>
        <AddLocation />
        <AddTask />
      </main>
    </div>
  );
};

export default Home;
