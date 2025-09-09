

    const extractAddressFields = (addressComponents) => {
          const getComponent = (
            primaryType,
            fallbackType = null,
            useShort = false
          ) => {
            const comp = addressComponents?.find(
              (c) =>
                c.types.includes(primaryType) ||
                (fallbackType && c.types.includes(fallbackType))
            );
            return comp ? (useShort ? comp.short_name : comp.long_name) : "";
          };

          return {
            city: getComponent("locality", "sublocality_level_1"),
            state: getComponent("administrative_area_level_1"),
            state_code: getComponent("administrative_area_level_1", null, true),
            country: getComponent("country"),
            country_code: getComponent("country", null, true),
            postal_code: getComponent("postal_code"),
            street_number: getComponent("street_number"),
            route: getComponent("route"),
          };
        };



        export default extractAddressFields