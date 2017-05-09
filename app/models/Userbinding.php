<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Userbinding extends Model
{
    public $id;
    public $user_id;
    public $calendar_id;

    public function initialize() {
        $this->belongsTo("trip_id", "Trip", "id");
        $this->belongsTo("user_id", "Users", "id");
    }


}
