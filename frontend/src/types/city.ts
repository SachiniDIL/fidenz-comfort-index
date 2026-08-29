export interface City {
  /** OpenWeatherMap city id, used for the per-city forecast endpoint. */
  cityCode?: string;
  cityName: string;
  description: string;
  temperature: number;
  comfortScore: number;
  rank: number;
}
