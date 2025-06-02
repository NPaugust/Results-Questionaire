export const getRegionSlug = (courtName: string): string => {
    const regionMap: { [key: string]: string } = {
      "Таласский областной суд": "Talas",
      "Иссык-кульский областной суд": "Issyk-Kyl",
      "Нарынский областной суд": "Naryn",
      "Баткенский областной суд": "Batken",
      "Чуйский областной суд": "Chyi",
      "Ошский областной суд": "Osh",
      "Жалал-Абадский областной суд": "Djalal-Abad",
      "Бишкекский городской суд": "Bishkek",
    };
    return regionMap[courtName] || "court-id";
  };
  