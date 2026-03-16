<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReferentialSeeder extends Seeder
{
    /**
     * Seed default room types and action types.
     */
    public function run(): void
    {
        $this->seedRoomTypes();
        $this->seedActionTypes();
    }

    private function seedRoomTypes(): void
    {
        $roomTypes = [
            ['name' => 'bathroom',    'name_fr' => 'Salle de bain',    'icon' => "\u{1F6BF}",  'sort_order' => 1],
            ['name' => 'kitchen',     'name_fr' => 'Cuisine',          'icon' => "\u{1F373}",  'sort_order' => 2],
            ['name' => 'bedroom',     'name_fr' => 'Chambre',          'icon' => "\u{1F6CF}\u{FE0F}", 'sort_order' => 3],
            ['name' => 'living_room', 'name_fr' => 'Salon',            'icon' => "\u{1F6CB}\u{FE0F}", 'sort_order' => 4],
            ['name' => 'dining_room', 'name_fr' => 'Salle à manger',  'icon' => "\u{1F37D}\u{FE0F}", 'sort_order' => 5],
            ['name' => 'office',      'name_fr' => 'Bureau',           'icon' => "\u{1F4BC}",  'sort_order' => 6],
            ['name' => 'laundry',     'name_fr' => 'Buanderie',        'icon' => "\u{1F455}",  'sort_order' => 7],
            ['name' => 'garage',      'name_fr' => 'Garage',           'icon' => "\u{1F697}",  'sort_order' => 8],
            ['name' => 'garden',      'name_fr' => 'Jardin',           'icon' => "\u{1F33F}",  'sort_order' => 9],
            ['name' => 'terrace',     'name_fr' => 'Terrasse',         'icon' => "\u{2600}\u{FE0F}",  'sort_order' => 10],
            ['name' => 'other',       'name_fr' => 'Autre',            'icon' => "\u{1F4E6}",  'sort_order' => 99],
        ];

        $now = now();

        foreach ($roomTypes as $roomType) {
            DB::table('room_types')->updateOrInsert(
                ['name' => $roomType['name'], 'user_id' => null],
                array_merge($roomType, [
                    'user_id'    => null,
                    'is_active'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }

    private function seedActionTypes(): void
    {
        $actionTypes = [
            ['name' => 'cleaning',       'name_fr' => 'Nettoyage',           'icon' => "\u{1F9F9}",  'position_filter' => json_encode(['housekeeper']),                                                    'sort_order' => 1],
            ['name' => 'dusting',        'name_fr' => 'Dépoussiérage',      'icon' => "\u{1FAB6}",  'position_filter' => json_encode(['housekeeper']),                                                    'sort_order' => 2],
            ['name' => 'vacuuming',      'name_fr' => 'Aspirateur',          'icon' => "\u{1F50C}",  'position_filter' => json_encode(['housekeeper']),                                                    'sort_order' => 3],
            ['name' => 'mopping',        'name_fr' => 'Serpillère',         'icon' => "\u{1F9FD}",  'position_filter' => json_encode(['housekeeper']),                                                    'sort_order' => 4],
            ['name' => 'ironing',        'name_fr' => 'Repassage',           'icon' => "\u{1F454}",  'position_filter' => json_encode(['housekeeper']),                                                    'sort_order' => 5],
            ['name' => 'laundry',        'name_fr' => 'Lessive',             'icon' => "\u{1F9FA}",  'position_filter' => json_encode(['housekeeper']),                                                    'sort_order' => 6],
            ['name' => 'dishes',         'name_fr' => 'Vaisselle',           'icon' => "\u{1F37D}\u{FE0F}", 'position_filter' => json_encode(['housekeeper', 'cook']),                                     'sort_order' => 7],
            ['name' => 'cooking',        'name_fr' => 'Cuisine',             'icon' => "\u{1F468}\u{200D}\u{1F373}", 'position_filter' => json_encode(['cook']),                                            'sort_order' => 8],
            ['name' => 'meal_prep',      'name_fr' => 'Préparation repas',  'icon' => "\u{1F957}",  'position_filter' => json_encode(['cook']),                                                            'sort_order' => 9],
            ['name' => 'mowing',         'name_fr' => 'Tonte',               'icon' => "\u{1F331}",  'position_filter' => json_encode(['gardener']),                                                        'sort_order' => 10],
            ['name' => 'pruning',        'name_fr' => 'Taille',              'icon' => "\u{2702}\u{FE0F}", 'position_filter' => json_encode(['gardener']),                                                  'sort_order' => 11],
            ['name' => 'watering',       'name_fr' => 'Arrosage',            'icon' => "\u{1F4A7}",  'position_filter' => json_encode(['gardener']),                                                        'sort_order' => 12],
            ['name' => 'weeding',        'name_fr' => 'Désherbage',         'icon' => "\u{1F33E}",  'position_filter' => json_encode(['gardener']),                                                        'sort_order' => 13],
            ['name' => 'planting',       'name_fr' => 'Plantation',          'icon' => "\u{1F33A}",  'position_filter' => json_encode(['gardener']),                                                        'sort_order' => 14],
            ['name' => 'childcare',      'name_fr' => "Garde d'enfants",     'icon' => "\u{1F476}",  'position_filter' => json_encode(['nanny']),                                                           'sort_order' => 15],
            ['name' => 'homework_help',  'name_fr' => 'Aide aux devoirs',    'icon' => "\u{1F4DA}",  'position_filter' => json_encode(['nanny']),                                                           'sort_order' => 16],
            ['name' => 'driving',        'name_fr' => 'Conduite',            'icon' => "\u{1F697}",  'position_filter' => json_encode(['driver']),                                                          'sort_order' => 17],
            ['name' => 'security_check', 'name_fr' => 'Ronde de sécurité', 'icon' => "\u{1F512}",  'position_filter' => json_encode(['guard']),                                                           'sort_order' => 18],
            ['name' => 'other',          'name_fr' => 'Autre',               'icon' => "\u{1F4CB}",  'position_filter' => json_encode(['housekeeper', 'gardener', 'cook', 'driver', 'nanny', 'guard', 'other']), 'sort_order' => 99],
        ];

        $now = now();

        foreach ($actionTypes as $actionType) {
            DB::table('action_types')->updateOrInsert(
                ['name' => $actionType['name'], 'user_id' => null],
                array_merge($actionType, [
                    'user_id'    => null,
                    'is_active'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}
