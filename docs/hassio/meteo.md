### Introduction



### Mise en page

J'utilise le mode "sections" avec 4 colonnes et l'en-tête. Dans les faits, la troisième colonne est en fait double : il s'agit de cartes météo qui gagnent à prendre un peu plus d'espace.

### L'en-tête

L'en-tête, ou *header* est la portion située en haut de l'onglet. Elle est limitée en terme de fonctionnalités, mais c'est la première chose qu'on voit : idéale donc pour les alertes météo ou les allergies. Afin d'éviter un encombrement, on crée des cartes conditionnelles qui ne s'affichent que lorsque l'entité choisie est active.

!!! tip "Source ?"

    J'utilise l'intégration de l'[IRM](https://github.com/jdejaegh/irm-kmi-ha), puisque je suis belge. Pour les autres, [AccuWeather](https://www.home-assistant.io/integrations/accuweather/) fourni les concentrations précises et le niveau de danger associé.

<figure markdown="span">
  ![Header](/assets/hassio/header.png)
</figure>

Chacun des pollens mesurés possède son propre badge, dont voici le code :

``` yaml
type: entity # Simple badge entité
show_name: true # On affiche le nom du pollen incriminé
show_state: false # Le nom suffit, pas besoin de la valeur précise
show_icon: true # Parce que c'est plus sympa avec
entity: sensor.maison_grasses_level # Attention ici, si on utilise AccuWeather, le senseur aura une forme de type "sensor.maison_grass_pollen_day_0" (*maison* étant le nom de l'intégration Accuweather dans mon cas, *0* étant le jour d'aujourd'hui)
name: Graminées # On précise le nom français
show_entity_picture: false # Pas besoin
color: pink # Plus contrasté que le rouge, je le préfère pour les dangers.
visibility: # On modifie la visibilité ici pour qu'il ne s'affiche que si le capteur est différent de *none* (aucun), unavalaible (indisponible) ou unknown (inconnu). En gros : s'il est actif.
  - condition: state
    entity: sensor.maison_grasses_level
    state_not: none
  - condition: state
    entity: sensor.maison_grasses_level
    state_not: unavailable
  - condition: state
    entity: sensor.maison_grasses_level
    state_not: unknown
```

### Première colonne : Météo temps réel et prévisions

<figure markdown="span">
  ![MétéoNow](/assets/hassio/meteonow.png)
</figure>

La météo actuelle est donnée par l'intégration [IRM](https://github.com/jdejaegh/irm-kmi-ha) (disponible sur HACS). Météo-France fourni à peu près les mêmes informations. Les informations manquantes depuis l'[IRM](https://github.com/jdejaegh/irm-kmi-ha) sont récupérées par [tomorrow.io](https://www.home-assistant.io/integrations/tomorrowio/) et [AccuWeather.](https://www.home-assistant.io/integrations/accuweather/) Enfin, la carte est la [Platinium Weather Card](https://github.com/tommyjlong/platinum-weather-card), disponible sur HACS.

??? tip "Trop de code tue le code"

    ```yaml
    custom1_icon: mdi:cloud
    custom1_units: "%"
    custom1_value: sensor.maison_couverture_nuageuse
    entity_apparent_temp: sensor.maison_temperature_apparente
    entity_fire_danger: sensor.tomorrow_io_maison_indice_d_incendie
    entity_forecast_icon: weather.maison
    entity_forecast_max: sensor.maison_realfeel_temperature_max_day_0
    entity_forecast_min: sensor.maison_realfeel_temperature_min_day_0
    entity_humidity: sensor.namur_belgium_humidite
    entity_pop: sensor.maison_precipitation
    entity_pos: sensor.maison_precipitation
    entity_pressure: sensor.maison_current_pressure
    entity_summary: sensor.maison_condition_day_0
    entity_sun: sun.sun
    entity_temperature: sensor.maison_temperature
    entity_uv_alert_summary: sensor.maison_current_uv_index
    entity_wind_bearing: sensor.maison_current_wind_bearing
    entity_wind_gust: sensor.maison_vitesse_des_rafales
    entity_wind_speed: sensor.maison_current_wind_speed
    option_locale: fr
    section_order:
      - overview
      - extended
      - slots
      - daily_forecast
    show_section_extended: false
    slot_l1: forecast_max
    slot_l2: pressure
    slot_l3: sun_next
    slot_l4: wind
    slot_l5: remove
    slot_l6: remove
    slot_l7: remove
    slot_l8: remove
    slot_r1: forecast_min
    slot_r2: popforecast
    slot_r3: sun_following
    slot_r4: custom1
    slot_r5: remove
    slot_r6: remove
    slot_r7: remove
    slot_r8: remove
    text_card_title: Météo actuelle
    type: custom:platinum-weather-card
    ```

Les prévisions sont séparées en deux cartes: l'une pour les prochaines heures, l'autre pour les jours suivants. Dans les deux cas, la carte est fournie par [Weather Chart Card](https://github.com/mlamberts78/weather-chart-card), disponible sur HACS.

Les prévisions pour les prochaines heures sont fournies par [tomorrow.io](https://www.home-assistant.io/integrations/tomorrowio/), que je trouve plus proche de la réalité.

<figure markdown="span">
  ![ForecastHours](/assets/hassio/forecasthours.png)
</figure>

??? tip "Trop de code tue le code"

    ```yaml
    type: custom:weather-chart-card
    entity: weather.tomorrow_io_maison_daily
    show_main: false
    show_temperature: false
    show_current_condition: false
    show_attributes: false
    show_time: false
    show_time_seconds: false
    show_day: false
    show_date: false
    show_humidity: false
    show_pressure: false
    show_wind_direction: true
    show_wind_speed: true
    show_sun: true
    show_feels_like: false
    show_dew_point: false
    show_wind_gust_speed: false
    show_visibility: false
    show_last_changed: false
    use_12hour_format: false
    icons_size: 25
    animated_icons: true
    icon_style: style1
    autoscroll: true
    forecast:
      precipitation_type: rainfall
      show_probability: false
      labels_font_size: "11"
      precip_bar_size: "100"
      style: style1
      show_wind_forecast: true
      condition_icons: true
      round_temp: false
      type: hourly
      number_of_forecasts: "0"
      disable_animation: false
    units:
      speed: ""
    ```

Les prévisions pour les prochains jours sont fournies, elles, par [AccuWeather](https://www.home-assistant.io/integrations/accuweather/), généralement plus pertinent sur le moyen terme. La carte est exactement la même, il suffit d'adapter le paramètre `forecast:type`.

<figure markdown="span">
  ![ForecastDays](/assets/hassio/forecastdays.png)
</figure>

### Deuxième colonne : Environnement extérieur

Une jauge indique l'indice UV, maximum et actuel, mis à jour toutes les heures. Les données sont fournies par [Open-UV](https://www.home-assistant.io/integrations/openuv/), la carte étant une [Gauge Card Pro](https://github.com/benjamin-dcs/gauge-card-pro).

<figure markdown="span">
  ![UVGauge](/assets/hassio/indiceUV.png)
</figure>

??? tip "Trop de code tue le code"

    ```yaml
    type: custom:gauge-card-pro
    segments:
      - from: 0
        color: var(--green-color)
      - from: 3
        color: rgb(255, 255, 0)
      - from: 5
        color: "#FFA500"
      - from: 7
        color: red
    needle: true
    needle_color: "#111"
    gradient: true
    min: 0
    max: 10
    titles:
      primary: Indice UV
    grid_options:
      columns: 6
      rows: 3
    setpoint:
      value: "{{ states(entity2) }}"
      color: "#111"
      type: template
    inner:
      mode: severity
      segments:
        - from: 0
          color: var(--green-color)
        - from: 3
          color: rgb(255, 255, 0)
        - from: 5
          color: "#FFA500"
        - from: 7
          color: red
      gradient: true
      gradient_resolution: medium
    value_texts:
      primary_font_size_reduction: 5.5
      primary: "Actuel : {{ states(entity) }}"
      secondary: "Max : {{ states(entity2) }}"
    gradient_resolution: medium
    entity: sensor.openuv_indice_uv_actuel
    entity2: sensor.openuv_indice_uv_maximal
    ```

??? warning "Pas d'auto-update"

    L'entité n'est pas mise à jour automatiquement. Pour cela, il suffit de créer une automatisation dans la section appropriée.
    ```yaml
    alias: Update OpenUV
    description: ""
    triggers:
      - trigger: time_pattern
        minutes: /60
    conditions:
      - condition: numeric_state
        entity_id: sun.sun
        value_template: "{{ state.attributes.elevation }}"
        above: 10
    actions:
      - action: homeassistant.update_entity
        target:
          entity_id: sensor.openuv_indice_uv_actuel
        data: {}
    ```

La qualité de l'air est fournie par l'intégration [WAQI](https://www.home-assistant.io/integrations/waqi/). Les données sont mises en forme de manière un peu particulières: c'est une pile verticale, dans son titre une carte conditionnelle affiche le polluant principal, des [Bubble Card](https://github.com/Clooos/Bubble-Card) indiquent, dans une pile horizontale, la concentration de chaque polluant. Ces données sont ensuite mises en forme au sein de la pile verticale par un graphique représentant les données des dernières 24H par [Apex Charts Card](https://github.com/RomRider/apexcharts-card).

<figure markdown="span">
  ![AirQuality](/assets/hassio/airquality.png)
</figure>

??? tip "Trop de code tue le code"

    ```yaml
    type: vertical-stack
    cards:
      - type: heading
        icon: mdi:radioactive
        heading: Pollution de l'air
        heading_style: subtitle
        badges:
          - type: entity
            show_state: true
            show_icon: false
            entity: sensor.namur_belgium_dominant_pollutant
            name: Polluant principal
            color: accent
            state_content:
              - name
              - state
      - type: horizontal-stack
        cards:
          - type: custom:bubble-card
            card_type: button
            button_type: state
            entity: sensor.namur_belgium_pm2_5
            name: PM2.5
            force_icon: false
            show_icon: false
            show_attribute: false
            attribute: state_class
            card_layout: normal
          - type: custom:bubble-card
            card_type: button
            button_type: state
            entity: sensor.namur_belgium_pm10
            name: PM10
            force_icon: false
            show_icon: false
            show_attribute: false
            attribute: state_class
            card_layout: normal
          - type: custom:bubble-card
            card_type: button
            button_type: state
            entity: sensor.namur_belgium_ozone
            name: Ozone
            force_icon: false
            show_icon: false
            show_attribute: false
            attribute: state_class
            card_layout: normal
          - type: custom:bubble-card
            card_type: button
            button_type: state
            entity: sensor.namur_belgium_nitrogen_dioxide
            name: Nitrés
            force_icon: false
            show_icon: false
            show_attribute: false
            attribute: state_class
            card_layout: normal
      - type: custom:apexcharts-card
        header:
          show: false
          title: Pollution de l'air - Namur
          show_states: true
          colorize_states: true
        series:
          - entity: sensor.namur_belgium_pm2_5
            name: PM2.5
            show:
              legend_value: false
          - entity: sensor.namur_belgium_pm10
            name: PM2.5
          - entity: sensor.namur_belgium_ozone
            name: O3
          - entity: sensor.namur_belgium_nitrogen_dioxide
            name: NO2
    ```

### Troisième et quatrième colonnes : Cartes en temps réél

<figure markdown="span">
  ![Radars](/assets/hassio/radars.png)
</figure>

J'utilise les cartes en temps réel fournies par le site [Windy](https://embed.windy.com/config/map). Elles sont au nombre de 4 : Vents, Pluie, Températures et risques incendies, intégrées par un iframe.

``` yaml
type: iframe
url: >-
  https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=9&overlay=wind&product=ecmwf&level=surface&lat=50.45&lon=4.9&detailLat=50.45&detailLon=4.9&marker=true&message=true
grid_options:
  columns: 12
  rows: 6
```