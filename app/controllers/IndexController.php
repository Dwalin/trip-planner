<?php


//namespace RestApi\Api\Controllers;

use Phalcon\Mvc\Controller;
use Phalcon\Http\Response;
use Phalcon\Http\Request;


class IndexController extends RestController {

    /**
     * @Post("/api/users/login")
     */
    public function loginAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $email       = $this->request->getPost('email');
        $password    = $this->request->getPost('password');


        $user = Users::findFirstByEmail($email);

        //print_r($password);
        //print_r($user->password);
        //print_r($user->password);

        if ($user) {
            if ($this->security->checkHash($password, $user->password)) {
                $response->setStatusCode(201, "Success");
                $response->setJsonContent(
                    array(
                        'status' => 'OK',
                        'action' => 'logged',
                        'data'   => $user
                    )
                );

                //var_dump($_COOKIE);

                setcookie("user", $user->toArray());
                $this->session->set("user", $user->toArray());

            } else {
                // Change the HTTP status
                $response->setStatusCode(409, "Conflict");

                // Send errors to the client
                $response->setJsonContent(
                    array(
                        'status'   => 'WRONG PASSWORD',
                    )
                );

            }

        } else {
            // Change the HTTP status
            $response->setStatusCode(404, "Not found");

            // Send errors to the client
            $response->setJsonContent(
                array(
                    'status'   => 'NO SUCH USER',
                )
            );
        }

        return $response;

    }

    /**
     * @Get("/api/users/logout")
     */
    public function logoutAction() {
        $response = new Response();

        setcookie("user", '');
        $this->session->destroy();

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'logged out',
            )
        );

        return $response;

    }

    /**
     * @Get("/api/users/current")
     */
    public function currentUserAction() {

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst(
            array(
                "id = '$userId'",
                "columns" => "id, name"
            )
        );

        $this->response->setJsonContent(
            $user->toArray('name', 'id')
        );

        return $response;

    }

    /**
     * @Get("/api/users/")
     */
    public function usersAction() {

        $response = new Response();

        $users = Users::find(array(
            "columns" => "id, email"
                             ));
        $users->rewind();

        while ($users->valid()) {
            $user[] = $users->current()->toArray();
            $users->next();
        }

        $response->setStatusCode(201, "Success");
        $response->setJsonContent(
            array(
                'status' => 'OK',
                'action' => 'found',
                'data'   => $user
            )
        );

        return $response;

    }

    /**
     * @Post("/api/users/register")
     */
    public function registerAction() {
        $response = new Response();
        $request = $this->request->getPost();

        $user = new Users();

//        $user->login        = $this->request->getPost('login');
//        $user->name        = $this->request->getPost('name');
        $user->email       = $this->request->getPost('email');
        $user->password    = $this->security->hash($this->request->getPost('password'));

        $calendar = new Calendar();
        $calendar -> name = $this->request->getPost('email');

        $userbinding = new Userbinding();
        $userbinding->Users = $user;
        $userbinding->Calendar = $calendar;

        if ($userbinding->create() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $user
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($userbinding->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors
                )
            );
        }

        return $response;

    }


    /**
     * @Get("/api/trip/")
     */
    public function tripAction() {

        $response = new Response();

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

//        $trip = $user->getTrip();
//        $trip = $user->Trip;

        die(var_dump($user->toArray()));

        if ($trip) {

            $this->$response->setStatusCode(201, "Success");
            $this->$response->setJsonContent(
                array(
                    'status' => 'OK',
                    'data'   => $trip->toArray()
                )
            );

        } else {

            $this->$response->setStatusCode(404, "Not Found");
            $this->$response->setJsonContent(
                array(
                    'status' => 'Not found'
                )
            );

        }

        return $response;

    }









    /**
     * @Get("/api/calendar/")
     */
    public function calendarAction() {

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $calendar = $user->getCalendar();

//        $notes = $calendar->getNotes();
//        echo $calendar->id;

        $notes = Notes::find([
            "calendar_id = :id:",
            "bind" => [
                "id" => $calendar->toArray()[0]["id"]
            ]
        ]);

        $notes = $notes->toArray();

        foreach ($notes as $keyA => $noteA) {
            foreach ($notes as $keyB => $noteB) {
                if ($noteA != $noteB) {
                    if ($noteA['day'] == $noteB['day']) {
                        if (strtotime($noteA['created']) > strtotime($noteB['created'])) {
                            unset($notes[$keyB]);
                        };
                    };
                }

            }
        }

        $processedNotes = array();
        $counters = array();

        foreach ($notes as $note) {
            $processedNotes[] = $note;
            if ($note["counter"]) {
                $counters[] = array($note["day"], $note["counter"]);
            }
        }



        $this->response->setJsonContent(
            array(
                'notes'   => $processedNotes,
                'counters'   => $counters,
                'calendar' => $calendar->toArray()
            )

        );

        return $response;

    }

    /**
     * @Post("/api/calendar/")
     */
    public function noteAddAction() {

        $response = new Response();
        $request = $this->request->getPost();

        $userId = $this->session->get("user")['id'];
        $user = Users::findFirst($userId);

        $calendar = $user->getCalendar();

        $note = Notes::findFirst([
            "day = " . $this->request->getPost('day') . " AND calendar_id = " . $calendar->toArray()[0]["id"]
        ]);


        if ($note) {
            $note -> note          = $this->request->getPost('note');
        } else {
            $note = new Notes();
            $note -> day           = $this->request->getPost('day');
            $note -> note          = $this->request->getPost('note');
            $note -> calendar_id   = $calendar->toArray()[0]["id"];
        }

        if ($note->save() == true) {
            $response->setStatusCode(201, "Success");
            $response->setJsonContent(
                array(
                    'status' => 'OK',
                    'action' => 'created',
                    'data'   => $note
                )
            );
        } else {
            // Change the HTTP status
            $response->setStatusCode(409, "Conflict");

            // Send errors to the client
            $errors = array();
            foreach ($note->getMessages() as $message) {
                $errors[] = $message->getMessage();
            }

            $response->setJsonContent(
                array(
                    'status'   => 'ERROR',
                    'messages' => $errors,
                    'calendar' => $calendar->toArray()
                )
            );
        }

        return $response;

    }


}