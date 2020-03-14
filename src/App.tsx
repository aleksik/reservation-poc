import React, { useState, useEffect } from "react";
import cn from "classnames";

function enumValues<T>(t: T): ReadonlyArray<T[keyof T]> {
  const values = Object.values(t);
  const plainStringEnum = values.every(x => typeof x === "string");
  return plainStringEnum ? values : values.filter(x => typeof x !== "string");
}

enum Location {
  Kamppi = "Kamppi",
  Taimisto = "Taimisto",
  Tikkurila = "Tikkurila"
}

interface Service {
  id: number;
  name: string;
  catId: number;
  catName: string;
}

interface Category {
  id: number;
  name: string;
}

interface Provider {
  name: string;
  locations: Location[];
  getUrl: (locationId: number, categoryId: number, serviceId: number) => string;
  services: Service[];
}

const providers: Provider[] = [
  {
    name: "Hierontaote",
    locations: [Location.Kamppi],
    getUrl: (l, c, s) =>
      `https://nettivaraus5.ajas.fi/v/5970/?lid=15ed939dbfe6&palvelu=${s}&asiakaspalvelija=35&toimipiste=${l}`,
    services: [
      {
        id: 17,
        name: "45 min hieronta",
        catId: 1,
        catName: "Tutustumistarjous"
      },
      {
        id: 6,
        name: "Hieronta 30 min",
        catId: 2,
        catName: "Hieronta"
      },
      {
        id: 7,
        name: "Hieronta 45 min",
        catId: 2,
        catName: "Hieronta"
      },
      {
        id: 8,
        name: "Hieronta 60 min",
        catId: 2,
        catName: "Hieronta"
      },
      {
        id: 10,
        name: "Hieronta 75 min",
        catId: 2,
        catName: "Hieronta"
      },
      {
        id: 9,
        name: "Hieronta 90 min",
        catId: 2,
        catName: "Hieronta"
      },
      {
        id: 36,
        name: "Hierontaa osteopaattisin tekniikoin 45 min",
        catId: 3,
        catName: "Osteopatia"
      }
    ]
  },
  {
    name: "Wario",
    locations: [Location.Taimisto, Location.Tikkurila],
    getUrl: (l, c, s) =>
      `https://timma.fi/reservation/wario?category=${c}&service=${s}&user=5ca0e560fab66f013898a28f`,
    services: [
      {
        id: 2001,
        name: "Urheiluhieronta 30 min",
        catId: 2000,
        catName: "Urheiluhieronta"
      },
      {
        id: 2002,
        name: "Urheiluhieronta 45 min",
        catId: 2000,
        catName: "Urheiluhieronta"
      },
      {
        id: 2003,
        name: "Urheiluhieronta 60 min",
        catId: 2000,
        catName: "Urheiluhieronta"
      },
      {
        id: 2005,
        name: "Urheiluhieronta 90 min",
        catId: 2000,
        catName: "Urheiluhieronta"
      },
      {
        id: 2006,
        name: "Urheiluhieronta 120 min",
        catId: 2000,
        catName: "Urheiluhieronta"
      },
      {
        id: 3251,
        name: "Osteopaattinen hieronta",
        catId: 3250,
        catName: "Osteopatia"
      },
      {
        id: 3252,
        name: "Osteopaattinen hieronta (Lapset)",
        catId: 3250,
        catName: "Osteopatia"
      }
    ]
  }
];

const getCategories = (location: Location | null): Category[] => {
  if (location === null) {
    return [];
  }
  return providers
    .filter(provider => provider.locations.includes(location))
    .reduce((acc: Service[], curr: Provider) => {
      return [...acc, ...curr.services];
    }, [])
    .map(service => ({
      id: service.catId,
      name: service.catName
    }))
    .reduce((acc: Category[], curr: Category) => {
      if (!acc.find(c => c.id === curr.id)) {
        return [...acc, curr];
      }
      return acc;
    }, []);
};

const getServices = (category: Category | null): Service[] => {
  if (category === null) {
    return [];
  }
  return providers
    .reduce((acc: Service[], curr: Provider) => {
      return [
        ...acc,
        ...curr.services.filter(item => item.catId === category.id)
      ];
    }, [])
    .reduce((acc: Service[], curr: Service) => {
      if (!acc.find(s => s.id === curr.id)) {
        return [...acc, curr];
      }
      return acc;
    }, []);
};

const getLocationId = (location: Location) => {
  switch (location) {
    case Location.Kamppi:
      return 1;
    case Location.Taimisto:
      return 2;
    case Location.Tikkurila:
      return 1;
    default:
      return 0;
  }
};

const getUrl = (
  location: Location | null,
  category: Category | null,
  service: Service | null
) => {
  if (location !== null && category !== null && service !== null) {
    const provider = providers.find(i =>
      i.services.find(s => s.id === service.id)
    );
    if (provider) {
      return provider.getUrl(getLocationId(location), category.id, service.id);
    }
  }
  return null;
};

const App = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setCategories(getCategories(location));
    setCategory(null);
  }, [location]);

  useEffect(() => {
    setServices(getServices(category));
    setService(null);
  }, [category]);

  useEffect(() => {
    setUrl(getUrl(location, category, service));
  }, [service]);

  const onLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as unknown;
    if (value !== "0") {
      const newLocation = value as Location;
      setLocation(newLocation);
      return;
    }
    setLocation(null);
  };

  const onCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as unknown;
    if (value !== "0") {
      const newCategory = categories.find(
        item => item.id === parseInt(value as string)
      );
      if (newCategory) {
        setCategory(newCategory);
        return;
      }
    }
    setCategory(null);
  };

  const onServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as unknown;
    if (value !== "0") {
      const newService = services.find(
        item => item.id === parseInt(value as string)
      );
      if (newService) {
        setService(newService);
        return;
      }
    }
    setService(null);
  };

  return (
    <div className="container">
      <div className="form">
        <form>
          <p className="form-item">
            <label htmlFor="location">Toimipaikka</label>
            <select id="location" onChange={onLocationChange}>
              <option value="0">-- Valitse --</option>
              {enumValues(Location).map(location => (
                <option key={`${location}`} value={`${location}`}>
                  {location}
                </option>
              ))}
            </select>
          </p>
          <p className={cn("form-item", { disabled: categories.length === 0 })}>
            <label htmlFor="category">Kategoria</label>
            <select
              id="category"
              disabled={!categories}
              onChange={onCategoryChange}
            >
              <option value="0">-- Valitse --</option>
              {categories.length > 0 &&
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </p>
          <p className={cn("form-item", { disabled: services.length === 0 })}>
            <label htmlFor="category">Palvelu</label>
            <select
              id="category"
              disabled={!services}
              onChange={onServiceChange}
            >
              <option value="0">-- Valitse --</option>
              {services.length > 0 &&
                services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
            </select>
          </p>
        </form>
      </div>
      <div className="frame">
        {url ? (
          <iframe src={url} />
        ) : (
          <div className="help">Valitse sijainti, kategoria ja palvelu</div>
        )}
      </div>
    </div>
  );
};

export default App;
