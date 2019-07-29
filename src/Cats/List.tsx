import React, { useEffect, useState } from "react";
import { IotContext } from "../App";
import { Table, Card, CardHeader } from "reactstrap";
import { Iot } from "aws-sdk";
import { Loading } from "../Loading/Loading";
import { Error } from "../Error/Error";

const ListCats = ({ iot }: { iot: Iot }) => {
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState([] as { name: string }[]);
  const [error, setError] = useState();
  useEffect(() => {
    iot
      .listThings()
      .promise()
      .then(({ things }) => {
        setCats(
          (things || []).map(({ thingName }) => ({
            name: thingName || "unknown"
          }))
        );
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [iot]);
  if (loading) return <Loading text={"Herding cats..."} />;
  if (error) return <Error error={error} />;
  return (
    <Card>
      <CardHeader>Cats</CardHeader>
      <Table>
        <thead>
          <tr>
            <th>name</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(({ name }) => (
            <tr key={name}>
              <td>
                <a href={`/cat/${name}`}>{name}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export const List = () => (
  <IotContext.Consumer>
    {({ iot }) => <ListCats iot={iot} />}
  </IotContext.Consumer>
);
