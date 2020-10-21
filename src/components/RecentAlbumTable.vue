<template>
  <v-card>
    <v-data-table
      :items-per-page="5"
      :headers="headers"
      :search="search"
      :items="items"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search"
          class="mx-4"
          single-line
        ></v-text-field>
      </template>
      <template v-slot:item="{ item }">
        <tr>
          <td
            @click="$router.push(`a/${item.id}`)"
            v-text="item.title"
            class="text-start"
          ></td>
          <td class="text-start" v-text="longDate(item.time)"></td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.v-data-table td {
  cursor: pointer;
}
</style>

<script>
import { utils } from "../mixins/utils";

export default {
  name: "RecentVisitTable",
  props: ["items", "headerText"],
  mixins: [utils],
  data() {
    return {
      headers: [
        {
          text: "Title",
          value: "title",
        },
        { text: this.headerText, value: "time" },
      ],
      search: "",
    };
  },
};
</script>
